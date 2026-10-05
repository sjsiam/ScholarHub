import type { Metadata } from "next";
import { SavedList } from "@/components/saved/saved-list";
import "./saved.css";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = { title: "Saved scholarships" };

export default function SavedPage() {
  return (
    <main className="page">
      <RequireAuth>
        <header className="page-header">
          <span className="md-typescale-label-large eyebrow">
            Your shortlist
          </span>
          <h1 className="md-typescale-headline-large">Saved scholarships</h1>
          <p className="md-typescale-body-large muted">
            Keep track of the awards you plan to apply for and their deadlines.
          </p>
        </header>
        <SavedList />
      </RequireAuth>
    </main>
  );
}
