import Page from "@/components/pageWrapper";
import TransitionLink from "@/components/transitionLink";

export default function ContactPage() {
  return (
    <Page className="w-full">
      <section className="max-w-2xl mx-auto py-16">
        <h1 className="text-4xl font-bold mb-6 text-center">Get in Touch</h1>
        <form className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow">
          <input
            type="text"
            placeholder="Your Name"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Your Message"
            className="border border-gray-300 rounded px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>

        <div className="mt-12 text-center text-gray-700">
          <p>Email: contact@example.com</p>
          <p>Phone: +1 234 567 8900</p>
        </div>

        <div className="mt-6 text-center">
          <TransitionLink href="/">
            <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
              Back to Home
            </button>
          </TransitionLink>
        </div>
      </section>
    </Page>
  );
}
