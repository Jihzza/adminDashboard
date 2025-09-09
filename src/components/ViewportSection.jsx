// src/components/ViewportSection.jsx
export default function ViewportSection({ className = "", children }) {
    return (
      <div
        className={[
          // height = visible viewport - header - bottom nav - iOS notch
          "min-h-[calc(100dvh-var(--header-h,0px)-var(--nav-h,0px)-env(safe-area-inset-bottom))]",
          // only this area can scroll
          "overflow-auto pb-[calc(var(--nav-h,0px)+16px)]",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    );
  }
  