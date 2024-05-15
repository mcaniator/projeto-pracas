const Page = async ({ params }: { params: { activeTallysIds: string } }) => {
  const decodedActiveTallysString = decodeURIComponent(params.activeTallysIds);
  return <div>{decodedActiveTallysString}</div>;
};

export default Page;
