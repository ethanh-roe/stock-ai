import { Alert } from "@mui/material";

export const AuthError = ({
    error,
    onClose,
}: {
    error: string | null;
    onClose: () => void;
}) =>
    error ? (
        <Alert severity="error" onClose={onClose} sx={{ borderRadius: "12px" }}>
            {error}
        </Alert>
    ) : null;