"use client";
import InstagramManagementDashboard from "@/components/instagram/InstagramManagementDashboard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InstagramAdminPage() {
  return (
    <div className="min-h-screen bg-[color-mix(in_oklab,black,white_5%)] py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/#streams"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Streams
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-white">Instagram Management</h1>
            <p className="text-neutral-400 mt-1">
              Manage manual Instagram posts and configure third-party widgets
            </p>
          </div>
        </div>

        {/* Dashboard */}
        <InstagramManagementDashboard />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="text-center text-neutral-500 text-sm">
            <p>
              Changes made here will be reflected in the main Instagram stream.
              Manual posts are stored locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}