export async function uploadToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data.IpfsHash; // the CID
}

export async function uploadJSONToPinata(obj: any): Promise<string> {
  const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
  const file = new File(
    [blob],
    `${obj.username ? obj.username : "jobs/metadata"}.json`,
    { type: "application/json" },
  );
  return uploadToPinata(file);
}

export async function fetchFromPinata(cid: string): Promise<any> {
  const res = await fetch(
    `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`,
  );
  const data = await res.json();
  return data;
}
