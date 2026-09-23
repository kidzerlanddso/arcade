const KINDO_DONATION_URL =
  import.meta.env.VITE_KINDO_DONATION_URL ||
  "https://shop.kindo.co.nz/app/community-shop/Rototuna%20High%20Schools";

const impactProjects = [
  "Scholarships and student grants",
  "Learning resources and classroom equipment",
  "Wellbeing and pastoral support initiatives",
  "Co-curricular and alumni community programmes",
];

export default function DonationsPage() {
  return (
    <main className="donations-page">
      <header className="donations-hero">
        <p className="donations-eyebrow">AlumniConnect</p>
        <h1>Donations</h1>
        <p className="donations-lead">Giving back feels great.</p>
      </header>

      <section className="donations-section">
        <p>
          Rototuna Senior High School is an important part of our wider
          community. Donations through AlumniConnect help create scholarships,
          provide grants, and support a dynamic learning environment for current
          and future students.
        </p>
        <p>
          Your gift brings alumni and the school together around that goal.
          Where charitable status applies, donations may be tax deductible.
          Receipts for eligible donations are typically available through Kindo.
        </p>
      </section>

      <figure className="donations-banner">
        <img
          src="/donation.png"
          alt="Students holding a thank you sign next to a donations box"
        />
      </figure>

      {/*
      <section className="donations-section donations-form-card">
        <h2>Your Donation</h2>
        <p className="donations-tax-note">
          Gifts may be allowable deductions for income tax purposes. You can
          claim a donation tax credit online in myIR. More information:{" "}
          <a
            href="https://www.ird.govt.nz/donations"
            target="_blank"
            rel="noopener noreferrer"
          >
            ird.govt.nz/donations
          </a>
          .
        </p>
        ...amount grid, other field, regular checkbox...
      </section>
      */}
    
      <section className="donations-section">
        <a
          className="donations-cta"
          href={KINDO_DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate
        </a>
        <p className="donations-tax-note">
        Gifts may be allowable deductions for income tax purposes. You can
        claim a donation tax credit online in myIR. More information:{" "}
        <a
          href="https://www.ird.govt.nz/donations"
          target="_blank"
          rel="noopener noreferrer"
        >
          ird.govt.nz/donations
        </a>
        .
      </p>
      </section>

      <section className="donations-section">
        <h2>Questions or a specific project?</h2>
        <p>
          If you would like to donate to a particular project, or you have
          questions, please contact the school alumni team and they will get
          back to you.
        </p>
        <a className="donations-email" href="mailto:communication@rhs.school.nz">
          alumni@example.school.nz
        </a>
      </section>

      <section className="donations-section">
        <h2>Where support makes a difference</h2>
        <p>Recent kinds of projects alumni giving can help fund include:</p>
        <ul className="donations-list">
          {impactProjects.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
