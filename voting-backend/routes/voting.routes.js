import { Router } from "express";
import { pool } from "../db.js";
import { config } from "../config.js";
import KorapayService from "../services/korapay.service.js";

const router = Router();

const defaultSettings = () => ({
  eventName: config.voting.eventName,
  eventEdition: config.voting.eventEdition,
  awardsDate: config.voting.awardsDate,
  votingClosesAt: config.voting.closesAt,
  votePrice: config.voting.votePrice,
  currency: config.voting.currency,
  votingOpen: "1",
  paymentProvider: "korapay",
  paymentProviderLabel: "Korapay",
  paymentProviderDescription: "Secured by Korapay",
});

const loadSettings = async () => {
  const base = defaultSettings();
  try {
    const [rows] = await pool.query(
      `SELECT setting_key, setting_value
       FROM voting_settings`,
    );

    for (const row of rows) {
      if (row.setting_key in base) {
        base[row.setting_key] = row.setting_value;
      }
    }
  } catch (_error) {
  }

  return {
    ...base,
    votePrice: Number(base.votePrice),
    votingOpen: String(base.votingOpen) !== "0",
  };
};

const votingIsOpen = (settings) => {
  if (!settings.votingOpen) {
    return false;
  }

  if (!settings.votingClosesAt) {
    return true;
  }

  return new Date(settings.votingClosesAt).getTime() > Date.now();
};

const categorySelectBase = `
  SELECT
    c.id,
    c.slug,
    c.name,
    c.description,
    c.group_key AS groupKey,
    c.group_name AS groupName,
    c.accent_color AS accentColor,
    c.hero_image AS heroImage,
    c.vote_price AS votePrice,
    COUNT(n.id) AS nomineeCount
  FROM voting_categories c
  LEFT JOIN voting_nominees n ON n.category_id = c.id AND n.is_active = 1
  WHERE c.is_active = 1
`;

const nomineeSelect = `
  SELECT
    n.id,
    n.slug,
    n.full_name AS name,
    n.category_id AS categoryId,
    c.slug AS categorySlug,
    c.name AS categoryName,
    c.group_key AS groupKey,
    n.department,
    n.level_label AS level,
    n.bio,
    n.photo_url AS photo,
    COALESCE(SUM(CASE WHEN t.status = 'confirmed' THEN t.votes ELSE 0 END), 0) AS voteCount
  FROM voting_nominees n
  INNER JOIN voting_categories c ON c.id = n.category_id
  LEFT JOIN voting_transactions t ON t.nominee_id = n.id
  WHERE n.is_active = 1 AND c.is_active = 1
`;

const withRankings = (rows) =>
  rows
    .sort((a, b) => Number(b.voteCount) - Number(a.voteCount))
    .map((row, index) => ({
      ...row,
      voteCount: Number(row.voteCount),
      ranking: index + 1,
    }));

router.get("/settings", async (_req, res, next) => {
  try {
    res.json(await loadSettings());
  } catch (error) {
    next(error);
  }
});

router.get("/sections", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, section_key, section_name, description, flyer_image_url, folder_name, sort_order, is_active
       FROM voting_sections
       WHERE is_active = 1
       ORDER BY sort_order ASC, section_name ASC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get("/overview", async (_req, res, next) => {
  try {
    const settings = await loadSettings();
    const [categories] = await pool.query(
      `${categorySelectBase} GROUP BY c.id ORDER BY c.group_sort ASC, c.sort_order ASC, c.name ASC`
    );
    const [leaderboardRows] = await pool.query(`${nomineeSelect} GROUP BY n.id`);
    
    const excludedKeywords = ['emerging', 'fresher', 'exceptional', 'male tech'];
    const filteredRows = leaderboardRows.filter(row => {
      const name = (row.categoryName || '').toLowerCase();
      return !excludedKeywords.some(kw => name.includes(kw));
    });

    const leaderboard = withRankings(filteredRows);

    res.json({
      settings,
      categories,
      featuredNominees: leaderboard.slice(0, 6),
      leaderboard: leaderboard.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/categories/:slug", async (req, res, next) => {
  try {
    const settings = await loadSettings();
    const [[category]] = await pool.query(
      `${categorySelectBase} AND c.slug = ? GROUP BY c.id`,
      [req.params.slug],
    );

    if (!category) {
      res.status(404).json({ message: "Category not found." });
      return;
    }

    const [nomineeRows] = await pool.query(
      `${nomineeSelect} AND c.slug = ? GROUP BY n.id`,
      [req.params.slug],
    );

    res.json({
      settings,
      category,
      nominees: withRankings(nomineeRows),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/nominees/:id", async (req, res, next) => {
  try {
    const settings = await loadSettings();
    const [nomineeRows] = await pool.query(
      `${nomineeSelect} AND (n.id = ? OR n.slug = ?) GROUP BY n.id`,
      [req.params.id, req.params.id],
    );

    const nominee = withRankings(nomineeRows)[0];

    if (!nominee) {
      res.status(404).json({ message: "Nominee not found." });
      return;
    }

    res.json({
      settings,
      nominee,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/leaderboard", async (req, res, next) => {
  try {
    const settings = await loadSettings();
    const groupKey = req.query.group;
    const params = [];
    const where = typeof groupKey === "string" && groupKey
      ? " AND c.group_key = ?"
      : "";

    if (where) {
      params.push(groupKey);
    }

    const [nomineeRows] = await pool.query(
      `${nomineeSelect}${where} GROUP BY n.id`,
      params,
    );

    const excludedKeywords = ['emerging', 'fresher', 'exceptional', 'male tech'];
    const filteredRows = nomineeRows.filter(row => {
      const name = (row.categoryName || '').toLowerCase();
      return !excludedKeywords.some(kw => name.includes(kw));
    });

    res.json({
      settings,
      nominees: withRankings(filteredRows),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/transactions/initialize", async (req, res, next) => {
  try {
    const settings = await loadSettings();

    if (!votingIsOpen(settings)) {
      res.status(409).json({ message: "Voting is currently closed." });
      return;
    }

    const nomineeId = Number.parseInt(String(req.body.nomineeId || ""), 10);
    const voterName = String(req.body.voterName || "").trim();
    const voterEmail = String(req.body.voterEmail || "").trim();
    const votes = Number.parseInt(String(req.body.votes || "0"), 10);

    if (!nomineeId || !voterName || !voterEmail || !votes || votes < 1) {
      res.status(422).json({ message: "Provide nominee, voter name, voter email, and valid votes." });
      return;
    }

    const [[nominee]] = await pool.query(
      "SELECT id, full_name, category_id FROM voting_nominees WHERE id = ? AND is_active = 1",
      [nomineeId],
    );

    if (!nominee) {
      res.status(404).json({ message: "Nominee not found." });
      return;
    }

    if (settings.closedCategories && settings.closedCategories.split(",").includes(String(nominee.category_id))) {
      res.status(409).json({ message: "Voting is currently closed for this category." });
      return;
    }

    const amount = votes * Number(settings.votePrice || config.voting.votePrice);
    const reference = `NASS-VOTE-${Date.now()}`;

    await pool.query(
      `INSERT INTO voting_transactions
      (reference, nominee_id, voter_name, voter_email, votes, amount, currency, payment_provider, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'korapay', 'pending')`,
      [reference, nomineeId, voterName, voterEmail, votes, amount, settings.currency || config.voting.currency],
    );

    // Dynamically resolve frontendUrl from client request to prevent localhost redirect issues
    const frontendUrl = req.body.frontendUrl || req.headers.origin || config.frontendUrl;
    const redirectUrl = `${frontendUrl.replace(/\/$/, "")}/voting/leaderboard?reference=${reference}`;

    const paymentResponse = await KorapayService.initializeTransaction({
      email: voterEmail,
      name: voterName,
      amount,
      reference,
      redirectUrl,
      metadata: {
        nominee_id: nomineeId,
        nominee_name: nominee.full_name,
        votes,
      },
    });

    const checkoutUrl =
      paymentResponse?.data?.checkout_url ||
      paymentResponse?.data?.authorization_url;

    res.json({
      reference,
      amount,
      currency: settings.currency || config.voting.currency,
      checkoutUrl,
      provider: "Korapay",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/transactions/verify/:reference", async (req, res, next) => {
  try {
    const verification = await KorapayService.verifyTransaction(req.params.reference);
    const chargeStatus = verification?.data?.status;

    if (chargeStatus === "success") {
      await pool.query(
        `UPDATE voting_transactions
         SET status = 'confirmed', provider_reference = ?, paid_at = NOW()
         WHERE reference = ?`,
        [verification?.data?.id || null, req.params.reference],
      );
    }

    res.json(verification);
  } catch (error) {
    next(error);
  }
});

router.post("/webhooks/korapay", async (req, res, next) => {
  try {
    const payload = req.body;
    const reference = payload?.data?.reference;
    const status = payload?.data?.status;

    if (reference && status === "success") {
      await pool.query(
        `UPDATE voting_transactions
         SET status = 'confirmed', provider_reference = ?, paid_at = NOW()
         WHERE reference = ?`,
        [payload?.data?.id || null, reference],
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
