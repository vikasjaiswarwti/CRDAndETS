
import { Button, Result } from 'antd'; // or your UI library
import { useAuth } from '../features/auth/hooks/useAuth';

export const NoRolePage = () => {

    const { handleLogout } = useAuth();

    return (
        <div style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg-page)"
        }}>
            <Result
                status="403"
                title="Access Denied"
                subTitle={
                    <div style={{ fontSize: "16px", color: "#475569" }}>
                        This role does not exist in the system<br />
                        or you are not authorized to use this application.
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleLogout}
                        danger
                    >
                        Logout
                    </Button>
                }
            />
        </div>
    );
};