export default function SiteFooter() {
  return (
    <footer>
      <p>
        © {new Date().getFullYear()} Tinabel Model College &amp; Tinuola
        Children School. All rights reserved.
      </p>
      <div className="footer-badge">
        <span className="f-pill pink">TMC — Secondary</span>
        <span className="f-pill blue">TCS — Primary</span>
      </div>
    </footer>
  );
}