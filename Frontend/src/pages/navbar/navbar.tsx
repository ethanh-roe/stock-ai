import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <>
            <nav>
                <h1>NavBar</h1>

                <Link to="/portfolio">Portfolio</Link>{" | "}
                <Link to="/">Dashboard</Link>
            </nav>
        </>
    )
}

export default NavBar;
