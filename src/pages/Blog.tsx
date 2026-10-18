import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { blogs as staticBlogs, BlogPost } from "@/data/blogs";
import { fetchBlogs } from "@/lib/content-service";

const Blog = () => {
  const [blogList, setBlogList] = useState<BlogPost[]>(staticBlogs);

  useEffect(() => {
    fetchBlogs().then((data) => {
      if (data && data.length > 0) {
        setBlogList(data);
      }
    });
  }, []);

  return (
    <Layout>
      {/* Banner */}
      <section className="relative isolate overflow-hidden bg-[#071f13] py-10 text-white sm:py-14">
        <div className="absolute inset-0 bg-gradient-to-b from-[#071f13]/90 via-[#0b3320]/80 to-[#071f13]" />
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-sky-300 mb-2">
            ACADEMIC INSIGHTS • NASS LASUSTECH
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Science & Tech Bulletin
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-emerald-100/80">
            Read the latest research discoveries, departmental spotlights, academic guidelines, and chapter updates from NASS LASUSTECH.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-10 text-black">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogList.map((blog) => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
