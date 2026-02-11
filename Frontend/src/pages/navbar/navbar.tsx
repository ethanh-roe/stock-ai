import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <>
            <nav>
                <h1>NavBar</h1>

                <Link to="/app">Dashboard</Link>{" | "}
                <Link to="/app/portfolio">Portfolio</Link>
            </nav>
        </>
    )
}

export default NavBar;
