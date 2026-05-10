export default function BigButton({ children, variant, ...props }) {
  const className = variant ? variant : '';
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
