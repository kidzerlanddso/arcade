import { useMemo, useState } from "react";

const KINDO_DONATION_URL =
  import.meta.env.VITE_KINDO_DONATION_URL || "https://www.mykindo.co.nz/";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

const impactProjects = [
  "Scholarships and student grants",
  "Learning resources and classroom equipment",
  "Wellbeing and pastoral support initiatives",
  "Co-curricular and alumni community programmes",
];

export default function DonationsPage() {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [isOther, setIsOther] = useState(false);
  const [otherAmount, setOtherAmount] = useState("");
  const [isRegular, setIsRegular] = useState(false);

  const donationAmount = useMemo(() => {
    if (isOther) {
      const parsed = Number(otherAmount);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return selectedAmount;
  }, [isOther, otherAmount, selectedAmount]);

  const handlePresetClick = (amount) => {
    setIsOther(false);
    setSelectedAmount(amount);
  };

  const handleOtherClick = () => {
    setIsOther(true);
  };

  const handleDonate = (event) => {
    event.preventDefault();
    if (!donationAmount) return;

    const url = new URL(KINDO_DONATION_URL);
    url.searchParams.set("amount", String(donationAmount));
    if (isRegular) {
      url.searchParams.set("frequency", "monthly");
    }
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

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
        <div
          className="donations-amount-grid"
          role="group"
          aria-label="Donation amount"
        >
          {PRESET_AMOUNTS.map((amount) => {
            const isActive = !isOther && selectedAmount === amount;
            return (
              <button
                key={amount}
                type="button"
                className={`donations-amount-btn${isActive ? " is-active" : ""}`}
                onClick={() => handlePresetClick(amount)}
                aria-pressed={isActive}
              >
                ${amount}
              </button>
            );
          })}
          <button
            type="button"
            className={`donations-amount-btn${isOther ? " is-active" : ""}`}
            onClick={handleOtherClick}
            aria-pressed={isOther}
          >
            Other
          </button>
        </div>

        {isOther && (
          <label className="donations-other-field">
            <span>Enter amount (NZD)</span>
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="e.g. 75"
              value={otherAmount}
              onChange={(event) => setOtherAmount(event.target.value)}
            />
          </label>
        )}

        <label className="donations-regular">
          <input
            type="checkbox"
            checked={isRegular}
            onChange={(event) => setIsRegular(event.target.checked)}
          />
          <span>Set up a regular donation</span>
        </label>

        <button
          type="button"
          className="donations-cta"
          onClick={handleDonate}
          disabled={!donationAmount}
        >
          Donate
       
          {isRegular ? " / month" : ""}
        </button>

        <p className="donations-note">
          Continues to the school&apos;s Kindo payment page. The official Kindo
          URL can be set with VITE_KINDO_DONATION_URL.
        </p>
      </section>

      <section className="donations-section">
        <h2>Questions or a specific project?</h2>
        <p>
          If you would like to donate to a particular project, or you have
          questions, please contact the school alumni team and they will get
          back to you.
        </p>
        <a className="donations-email" href="mailto:alumni@example.school.nz">
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
