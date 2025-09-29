import Page from "@/components/pageWrapper";
import TransitionLink from "@/components/transitionLink";

export default function AboutPage() {
  return (
    <Page>
      {/* Hero / About Section */}
      <section className="flex flex-col md:flex-row items-center gap-12 py-16">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-gray-700 mb-6">
            We build modern web applications that are fast, responsive, and
            delightful to use. Our mission is to create experiences that users
            love.
          </p>
          <TransitionLink href="/contact">
            <button className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition">
              Contact Us
            </button>
          </TransitionLink>
        </div>
        <div className="md:w-1/2">
          <img
            src="/about-illustration.svg"
            alt="About illustration"
            className="w-full rounded shadow"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid md:grid-cols-3 gap-6 mt-12 text-center">
        {[
          { label: "Projects", value: "120+" },
          { label: "Clients", value: "80+" },
          { label: "Awards", value: "15" },
        ].map((stat) => (
          <div key={stat.label} className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-700">{stat.label}</p>
          </div>
        ))}
      </section>
    </Page>
  );
}
