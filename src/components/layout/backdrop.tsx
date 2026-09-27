/** 固定在页面后面的柔和色块，让玻璃有东西可透。静态，不做动画。 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-[380px] -left-[220px] size-[900px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, var(--blob-1), transparent)' }}
      />
      <div
        className="absolute -top-[260px] -right-[160px] size-[780px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, var(--blob-2), transparent)' }}
      />
      <div
        className="absolute top-[420px] left-[20%] h-[700px] w-[1100px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, var(--blob-3), transparent)' }}
      />
    </div>
  )
}
