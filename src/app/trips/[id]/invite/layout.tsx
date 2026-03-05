export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Platesnė kelionių nuotrauka iš public/ (ne per didelė)
  const bgImage = "/invite-bg.jpg";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
