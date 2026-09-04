import { useNavigate } from "react-router-dom";

export default function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="page-container overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-8 pb-16">
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
            Terms of Use
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
              1. Acceptance of terms
            </h2>
            <p>
              By creating an account and using Thala, you agree to these Terms
              of Use. If you do not agree, please do not use the application.
              These terms apply to all users of the Thala web application.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              2. Who can use Thala
            </h2>
            <p>
              Thala is intended for university students aged 18 and above. By
              signing up, you confirm that you meet this requirement. We reserve
              the right to terminate accounts that do not meet eligibility
              criteria.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              3. Your account
            </h2>
            <p className="mb-2">You are responsible for:</p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {[
                "Maintaining the confidentiality of your account credentials",
                "All activity that occurs under your account",
                "Ensuring your account information is accurate and up to date",
                "Notifying us immediately of any unauthorised use",
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
              4. Acceptable use
            </h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="flex flex-col gap-1.5 pl-4">
              {[
                "Use Thala for any unlawful purpose",
                "Upload documents or content that infringes intellectual property rights",
                "Attempt to gain unauthorised access to other users' data",
                "Use the app to harass, threaten, or harm others",
                "Upload malicious files or attempt to compromise the application",
                "Create multiple accounts to abuse free tier limits",
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
              5. Mental health disclaimer
            </h2>
            <p>
              Thala is a productivity and wellbeing tool, not a medical or
              clinical service. The breathing exercises, mindfulness features,
              and motivational content are designed to support general student
              wellbeing and are not a substitute for professional mental health
              care.
            </p>
            <p className="mt-2">
              If you are experiencing a mental health crisis, please contact a
              qualified mental health professional or emergency services
              immediately. In Nigeria, you can reach the Suicide Prevention
              Helpline at{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                0800-800-2000
              </strong>
              .
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              6. Counselor booking
            </h2>
            <p>
              The counselor booking feature connects students with independent
              mental health professionals. Thala does not employ these
              professionals and is not responsible for the quality, outcomes, or
              content of counseling sessions. Any therapeutic relationship is
              solely between you and the counselor.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              7. User content
            </h2>
            <p>
              You own all content you create in Thala — your journal entries,
              tasks, and uploaded documents. By using the app, you grant us a
              limited licence to store and process this content solely for the
              purpose of providing the service to you. We do not use your
              content for any other purpose.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              8. Intellectual property
            </h2>
            <p>
              The Thala name, logo, design, and application code are the
              intellectual property of the Thala team. You may not reproduce,
              distribute, or create derivative works without our explicit
              written permission.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              9. Service availability
            </h2>
            <p>
              We aim to provide a reliable service but cannot guarantee
              uninterrupted access. We may perform maintenance, updates, or
              experience outages beyond our control. We are not liable for any
              loss resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              10. Limitation of liability
            </h2>
            <p>
              Thala is provided as-is. To the fullest extent permitted by law,
              we are not liable for any indirect, incidental, or consequential
              damages arising from your use of the application, including loss
              of data.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              11. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms. You may delete your account at any time from the
              Settings page. Upon termination, your data is permanently deleted
              in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              12. Governing law
            </h2>
            <p>
              These terms are governed by the laws of the Federal Republic of
              Nigeria. Any disputes shall be resolved in Nigerian courts of
              competent jurisdiction.
            </p>
          </section>

          <section>
            <h2
              className="font-display font-semibold text-slate-800 dark:text-white
              text-base mb-2"
            >
              13. Contact
            </h2>
            <p>
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:mycerebra@gmail.com"
                className="text-primary-400 underline underline-offset-2"
              >
                mycerebra@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
