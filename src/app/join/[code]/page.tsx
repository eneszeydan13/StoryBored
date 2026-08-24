import JoinClient from './JoinClient';

export function generateStaticParams() {
  return [
    { code: 'SPRINT1' },
    { code: 'default' },
  ];
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const resolved = await params;
  return <JoinClient code={resolved.code} />;
}
