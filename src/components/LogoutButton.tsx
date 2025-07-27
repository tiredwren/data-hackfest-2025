import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
    const {logout, isAuthenticated} = useAuth0();

    return (
        isAuthenticated && (
            <Button onClick={() => logout()}>
                Sign Out
            </Button>
        )
    )
}

export default LogoutButton