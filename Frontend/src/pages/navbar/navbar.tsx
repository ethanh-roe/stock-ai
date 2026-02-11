import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <>
            <nav>
                <h1>NavBar</h1>

                <Link to="/">Dashboard</Link>{" | "}
                <Link to="/portfolio">Portfolio</Link>
            </nav>
        </>
    )
}

export default NavBar;
