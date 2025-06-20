import { useEffect } from 'react';
import Head from 'next/head';
import htmlContent from '../public/index.html';

export default function Home() {
  useEffect(() => {
    // Import Bootstrap JS after component mounts
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <>
      <Head>
        <title>Hawaii Elite Real Estate - Find Your Perfect Property</title>
        <meta name="description" content="Find your perfect property in Hawaii with Hawaii Elite Real Estate. We specialize in luxury properties, oceanfront homes, and more across all Hawaiian islands." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}
