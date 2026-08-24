import BoardClient from './BoardClient';

export function generateStaticParams() {
  return [
    { id: 'sprint-1' },
    { id: 'default' },
  ];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <BoardClient id={resolved.id} />;
}
