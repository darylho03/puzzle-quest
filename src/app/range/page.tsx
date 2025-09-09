import Range from '../../components/Range';

export default function HomePage() {
    return (
        <div className="app">
            <Range />
            <div className="description">
                <p>Range (Kuromasu) Rules:</p>
                <p>Fill the grid with black and white cells while following these rules:</p>
                <ul>
                    <li>No two black cells can be orthogonally adjacent.</li>
                    <li>All white cells must be orthogonally connected.</li>
                    <li>Numbers in white cells represent the number of white cells that can be seen from that cell orthogonally (itself included). Black cells block the view.</li>
                </ul>
            </div>
        </div>
    );
}