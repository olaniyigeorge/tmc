// /src/components/ui/Card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...rest }) => (
  <div
    className={`rounded-lg border p-4 shadow-sm ${className ?? ""}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;