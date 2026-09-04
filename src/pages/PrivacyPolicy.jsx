import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="page-container overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-8 pb-16">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-primary-400
            transition-colors mb-6"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="mb-8">
          <h1
            className="font-display text-2xl font-bold text-slate-800
            dark:text-white mb-2"
          >
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">Last updated: June 1, 2026</p>
        </div>

        <div
          className="flex flex-col gap-6 text-sm text-slate-600 dark:text-slate-300
          leading-relaxed font-body"
        >
          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              1. Who we are
            </h2>
            <p>
              Thala is a student mental health and academic productivity
              application developed and operated by the Thala team. We are
              committed to protecting your privacy and handling your personal
              data with care and transparency.
            </p>
            <p className="mt-2">
              For any privacy-related questions, contact us at{" "}
              <a
                href="mailto:mycerebra@gmail.com"
                className="text-primary-400 underline underline-offset-2"
              >
                mycerebra@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              2. What data we collect
            </h2>
            <p className="mb-2">
              We collect only what is necessary to provide the service:
            </p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {[
                "Email address — for account creation and authentication",
                "Username and display name — for personalisation",
                "University name — to tailor your experience",
                "Tasks, journal entries, and study streaks — core app functionality",
                "Documents you upload — stored securely for your personal use",
                "App preferences — theme, notification settings, mindfulness duration",
                "Device and usage data — anonymised, for improving the app",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary-400
                    shrink-0 mt-1.5"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              3. How we use your data
            </h2>
            <p className="mb-2">Your data is used exclusively to:</p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {[
                "Provide and personalise the Thala experience",
                "Sync your data across devices when you are signed in",
                "Send transactional emails such as login links and password resets",
                "Improve app performance and fix bugs using anonymised analytics",
                "Notify you when new features you requested become available",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary-400
                    shrink-0 mt-1.5"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
              We do not sell, rent, or share your personal data with third
              parties for marketing purposes. Ever.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              4. Journal privacy
            </h2>
            <p>
              Your journal entries are private to you. They are stored securely
              in our database with row-level security — meaning no other user,
              including Thala staff, can access your entries through the
              application.
            </p>
            <p className="mt-2">
              Journal entries are additionally protected by a PIN you set. This
              PIN is stored in hashed form and cannot be recovered by our team.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              5. Documents
            </h2>
            <p>
              Documents you upload are stored in private, access-controlled
              cloud storage. Only your account can access your documents. Files
              are encrypted at rest and in transit. You can delete any document
              at any time from within the app.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              6. Third-party services
            </h2>
            <p className="mb-2">
              Thala uses the following third-party services to operate:
            </p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {[
                "Supabase — database, authentication, and file storage (EU region)",
                "Vercel — hosting and content delivery",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary-400
                    shrink-0 mt-1.5"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Each of these providers maintains their own privacy policies and
              security standards. We have selected them specifically for their
              strong data protection practices.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              7. Data retention
            </h2>
            <p>
              Your data is retained for as long as your account is active. If
              you delete your account, all associated data — including your
              profile, tasks, journal entries, streaks, documents, and
              preferences — is permanently deleted within 24 hours. This action
              is irreversible.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              8. Your rights
            </h2>
            <p className="mb-2">
              Under applicable data protection law (including Nigeria's NDPR),
              you have the right to:
            </p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {[
                "Access the personal data we hold about you",
                "Request correction of inaccurate data",
                "Request deletion of your data",
                "Export your data in a portable format",
                "Withdraw consent at any time",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-primary-400
                    shrink-0 mt-1.5"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:mycerebra@gmail.com"
                className="text-primary-400 underline underline-offset-2"
              >
                mycerebra@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              9. Children and minors
            </h2>
            <p>
              Thala is designed for university students aged 18 and above. We
              do not knowingly collect data from users under 18. If you believe
              a minor has created an account, please contact us immediately.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              10. Changes to this policy
            </h2>
            <p>
              We may update this policy as the app evolves. We will notify you
              of significant changes via email or an in-app notice. Continued
              use of Thala after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
