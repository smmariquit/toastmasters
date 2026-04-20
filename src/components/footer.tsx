import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-[#772432] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#c4a052]">
              Toastmasters Hub
            </h3>
            <p className="text-sm text-white/80">
              A meeting management tool for Toastmasters clubs. Track speeches,
              time performances, and improve your public speaking journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#c4a052]">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/clubs" className="hover:text-[#c4a052] transition-colors">
                  Browse Clubs
                </Link>
              </li>
              <li>
                <Link href="/meetings" className="hover:text-[#c4a052] transition-colors">
                  View Meetings
                </Link>
              </li>
              <li>
                <Link href="/tools/timer" className="hover:text-[#c4a052] transition-colors">
                  Timer Tool
                </Link>
              </li>
              <li>
                <Link href="/tools/ah-counter" className="hover:text-[#c4a052] transition-colors">
                  Ah Counter
                </Link>
              </li>
              <li>
                <Link href="/tools/grammarian" className="hover:text-[#c4a052] transition-colors">
                  Grammarian
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Resources */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-[#c4a052]">
              Official Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.toastmasters.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c4a052] transition-colors"
                >
                  Toastmasters International
                </a>
              </li>
              <li>
                <a
                  href="https://www.toastmasters.org/find-a-club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c4a052] transition-colors"
                >
                  Find a Club
                </a>
              </li>
              <li>
                <a
                  href="https://www.toastmasters.org/education/pathways"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#c4a052] transition-colors"
                >
                  Pathways Program
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm text-white/60">
          <p>
            © 2026 Toastmasters Hub. Not affiliated with
            Toastmasters International.
          </p>
          <p className="mt-2">
            Built with ❤️ for the Toastmasters community
          </p>
        </div>
      </div>
    </footer>
  );
}
