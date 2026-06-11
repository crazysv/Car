interface Testimonial {
  name: string;
  location: string;
  rating: number;
  text: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Rajiv Sharma",
    location: "Chandigarh",
    rating: 5,
    text: "Booked the Creta for a weekend trip to Shimla. Delivery was on time, car was spotless, and the online booking was super smooth. Highly recommend JP Rentals.",
    initials: "RS",
  },
  {
    name: "Priya Mehta",
    location: "Mohali",
    rating: 5,
    text: "Used JP Rentals for our family trip to Amritsar. The car was well-maintained and the WhatsApp support was very responsive. Will definitely use again.",
    initials: "PM",
  },
  {
    name: "Arjun Singh",
    location: "Panchkula",
    rating: 5,
    text: "Great experience overall. The Innova was available exactly as listed. Free delivery to our doorstep saved us a lot of hassle.",
    initials: "AS",
  },
  {
    name: "Neha Kapoor",
    location: "Kharar",
    rating: 5,
    text: "Rented the Fortuner for a wedding event. The vehicle was immaculate and delivery/pickup was perfectly on time. Premium service at a fair price.",
    initials: "NK",
  },
  {
    name: "Vikram Bhatia",
    location: "Zirakpur",
    rating: 5,
    text: "Super easy process — booked online, paid advance, got the car delivered. The Razorpay payment was secure and instant. Transparent pricing with zero hidden charges.",
    initials: "VB",
  },
];

export function Testimonials() {
  return (
    <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible lg:snap-none lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0">
      {testimonials.map((t) => (
        <article
          key={t.name}
          className="min-w-[85vw] sm:min-w-[360px] lg:min-w-0 snap-start flex-shrink-0 lg:flex-shrink bg-white rounded-2xl shadow-card border border-outline-variant p-6 md:p-8 flex flex-col justify-between hover:border-secondary transition-all duration-300"
        >
          {/* Stars */}
          <div>
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-secondary text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>

            {/* Quote */}
            <p className="font-body-md text-outline italic leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </p>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-outline-variant">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="text-sm font-bold text-on-secondary-container">
                {t.initials}
              </span>
            </div>
            <div>
              <p className="font-bold text-primary text-sm">{t.name}</p>
              <p className="text-xs text-outline uppercase tracking-widest">
                {t.location}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
