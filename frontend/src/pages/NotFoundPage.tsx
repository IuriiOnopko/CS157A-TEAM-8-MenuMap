import React from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-body text-ink">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16 flex flex-col gap-3">
        <h1 className="m-0 font-display text-3xl font-semibold tracking-tight">This page isn't here yet</h1>
        <p className="m-0 text-[15.5px] text-muted">It may be coming in a later sprint, or the link is wrong.</p>
        <Link to="/restaurants" className="w-fit text-[15px] font-semibold text-sage hover:text-sage-dark">
          Browse restaurants on the map
        </Link>
      </main>
      <Footer />
    </div>
  );
}
