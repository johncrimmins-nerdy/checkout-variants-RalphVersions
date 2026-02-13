import type { Metadata } from 'next';

import Image from 'next/image';

import tocau from '@/lib/content/terms-of-customer-account-use';
import { assetUrl } from '@/lib/utils/asset-url';

export const metadata: Metadata = {
  robots: 'noindex',
  title: 'Terms of customer account use',
};

/**
 * Terms of Customer Account Use page
 * Serves exact HTML content from original checkout-ts implementation
 */
export default function TermsOfCustomerAccountUsePage() {
  return (
    <div className="page-wrapper">
      {/* Navbar - matches original Webflow structure */}
      <div className="nav-wrapper">
        <div className="navbar-logo-left" role="banner">
          <div className="navbarcontainer mainnav">
            <div className="navbar-content">
              <div className="navbar-brand">
                <a
                  className="logo-link-block"
                  href="https://www.varsitytutors.com"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Image
                    alt="Varsity Tutors"
                    className="logo"
                    height={32}
                    src={assetUrl('/images/varsity-tutors-logo.svg')}
                    unoptimized
                    width={180}
                  />
                </a>
              </div>
            </div>
            <nav className="nav-menu" role="navigation">
              <a className="nav-link" href="https://www.varsitytutors.com/login">
                Sign In
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Page Main - matches original structure */}
      <div className="page-main">
        <section>
          <div className="container" id="tocau-content">
            <div className="u-mt-100vn" />
            {/* Content injected here - same as original JS injection */}
            <div dangerouslySetInnerHTML={{ __html: tocau }} />
          </div>
        </section>
      </div>

      {/* Styles matching original Webflow */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .page-wrapper {
          min-height: 100vh;
        }
        .nav-wrapper {
          background-color: #fff;
        }
        .navbar-logo-left {
          padding: 0 24px;
        }
        .navbarcontainer.mainnav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 0;
        }
        .navbar-content {
          display: flex;
          align-items: center;
        }
        .logo-link-block {
          display: block;
        }
        .logo {
          height: 32px;
          width: auto;
        }
        .nav-menu {
          display: flex;
          align-items: center;
        }
        .nav-link {
          color: #333;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          padding: 8px 16px;
        }
        .nav-link:hover {
          color: #000;
        }
        .page-main {
          background-color: #eee;
          min-height: calc(100vh - 64px);
          padding-top: 32px;
          padding-bottom: 32px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .u-mt-100vn {
          margin-top: 0;
        }
        /* Restore list styles that Tailwind Preflight resets */
        .terms-container ol {
          list-style-type: lower-alpha;
          padding-left: 30px;
          margin-bottom: 20px;
        }
        .terms-container ol li {
          margin-bottom: 10px;
        }
        .terms-container ul {
          list-style-type: disc;
          padding-left: 30px;
          margin-bottom: 20px;
        }
        .terms-container ul li {
          margin-bottom: 8px;
        }
      `,
        }}
      />
    </div>
  );
}
