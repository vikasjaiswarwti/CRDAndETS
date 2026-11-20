import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES, LoginPageLogoUrl } from '../../../shared/constants/app.constants';

const NotFoundPage: React.FC = () => {
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
                        height: '40px',
                        width: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </div>

            {/* Unauthorized Result */}
            <Result
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
                        Back to Dashboard
                    </Button>
                }
            />


        </div>



    );
};

export default NotFoundPage;