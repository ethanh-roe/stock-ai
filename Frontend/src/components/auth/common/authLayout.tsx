export const AuthLayout = ({
    left,
    right,
    className,
}: {
    left: React.ReactNode;
    right: React.ReactNode;
    className?: string;
}) => (
    <div className={className}>
        <div className={`${className}-left`}>{left}</div>
        <div className={`${className}-right`}>{right}</div>
    </div>
);