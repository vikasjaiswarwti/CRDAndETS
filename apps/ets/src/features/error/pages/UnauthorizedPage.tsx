import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES, LoginPageLogoUrl } from '../../../shared/constants/app.constants';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5'
        }}>
            {/* Commuter Logo */}
            <div style={{ marginBottom: '24px' }}>
                <img
                    src={LoginPageLogoUrl}
                    alt="Commuter Logo"
                    style={{
                        height: '80px',
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* Unauthorized Result */}
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={
                    <Button
                        type="primary"
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                    >
                        Back to Dashboard
                    </Button>
                }
            />
        </div>
    );
};

export default UnauthorizedPage;