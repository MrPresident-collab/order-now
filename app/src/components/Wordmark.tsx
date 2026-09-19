interface WordmarkProps {
  className?: string;
  dotClassName?: string;
}

export function Wordmark({ className = '', dotClassName = '' }: WordmarkProps) {
  return (
    <span className={`font-extrabold tracking-tight text-white ${className}`}>
      Pedejá<span className={`text-pedeja-500 ${dotClassName}`}>.</span>
    </span>
  );
}
