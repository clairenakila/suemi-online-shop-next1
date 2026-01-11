export default function ProfileCard() {
  return (
    <div className="card text-center shadow-sm" style={{ width: 400 }}>
      <div className="card-body p-4">
        <div
          className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: 180, height: 180, fontSize: '80px' }}
        >
          👤
        </div>

        <h5 className="fw-bold mb-1" style={{ fontSize: '20px' }}>Claire Nakila</h5>
        <p className="text-muted mb-3" style={{ fontSize: '15px' }}>@watashiclang</p>

        <p className="mt-4 text-muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>
          Block 9 Lot 3 Calliandra 2<br />
          Street Phase 1 Greenwoods<br />
          Village, Dasmariñas Cavite
        </p>
      </div>
    </div>
  );
}