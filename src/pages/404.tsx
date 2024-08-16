import Layout from "../components/layout";
import Title from "../components/title";

export default function NotFoundPage() {
  return (
    <Layout>
      <Title title="Home" />
      <div className="container mx-auto flex h-full items-center justify-center">
        <div className="flex">
          <div className="space-y-4 px-6 text-left">
            <a href="/">
              <h1
                className={`bg-purple-700 bg-gradient-to-r from-purple-700 via-red-500 to-yellow-500 bg-clip-text text-center font-sans text-6xl font-semibold leading-normal text-purple-700 text-transparent sm:text-9xl`}
              >
                404
              </h1>
            </a>
            <div className="text-center font-medium leading-tight md:text-left">
              <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
