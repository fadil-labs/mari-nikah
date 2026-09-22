export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary-light to-white">
      <div className="text-center px-6 max-w-md">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-serif text-dark mb-4">Undangan Tidak Ditemukan</h1>
        <p className="text-dark/60">
          Maaf, undangan yang Anda cari tidak dapat ditemukan. Periksa kembali link undangan yang Anda terima.
        </p>
      </div>
    </div>
  );
}
