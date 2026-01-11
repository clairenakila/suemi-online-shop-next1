export default function ProfileCard() {
  return (
    <div className="card text-center shadow-sm" style={{ width: 400 }}>
      <div className="card-body">
        <div
          className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: 150, height: 150 }}
        >
          👤
        </div>

        <h6 className="fw-semibold mb-0">Claire Nakila</h6>
        <small className="text-muted">@watashiclang</small>

        <p className="small mt-3 text-muted">
          Block 9 Lot 3 Calliandra 2<br />
          Street Phase 1 Greenwoods<br />
          Village, Dasmariñas Cavite
        </p>
      </div>
    </div>
  );
}
