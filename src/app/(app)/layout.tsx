import Layout from "@/components/Layout";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}
