import {
  Camera,
  Heart,
  ArrowUpRight,
  MessageCircle,
  Phone,
  Sparkles
} from "lucide-react";

import "./Contact.css";

function Contact() {
  return (
    <main className="contact-page">

      <section className="contact-hero">
        <span><Sparkles size={16} /> GET IN TOUCH</span>
        <h1>
          Let's Create
          <br />
          <strong>Something Beautiful.</strong>
        </h1>
        <p>
          Every great memory starts with a conversation.
          Contact PRL SHOOTS and let's plan your next shoot.
        </p>
      </section>

      <section className="contact-main">

        <div className="contact-qr-card">
          <Camera size={35} />
          <h2>Follow Our Journey</h2>
          <p>Scan our Instagram QR code</p>

          <img
            src="/instagram-qr.png"
            alt="PRL SHOOTS Instagram QR Code"
          />

          <h3>@prl_shoots.in</h3>

          <a
            href="https://www.instagram.com/prl_shoots.in/"
            target="_blank"
            rel="noreferrer"
            className="contact-action instagram-action"
          >
            Follow on Instagram <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="contact-details">

          <div className="contact-detail-card">
            <Phone size={28} />
            <span>CALL US</span>
            <h2>9705595348</h2>
            <a href="tel:+919705595348">
              Call Now <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="contact-detail-card">
            <MessageCircle size={28} />
            <span>WHATSAPP</span>
            <h2>Let's Chat</h2>
            <a
              href="https://wa.me/919705595348"
              target="_blank"
              rel="noreferrer"
            >
              Message Us <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="contact-detail-card">
            <Camera size={28} />
            <span>OUR STUDIO</span>
            <h2>PRL SHOOTS</h2>
            <p>Photography · Videography · Memories</p>
          </div>

        </div>

      </section>

      <section className="contact-bottom">
        <Heart size={24} />
        <h2>We'd Love to Capture Your Story.</h2>
        <p>PRL SHOOTS — Your Story, Our Lens.</p>
      </section>

    </main>
  );
}

export default Contact;
