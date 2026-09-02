import './sidebar.css'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ContrastRoundedIcon from '@mui/icons-material/ContrastRounded';
function SideBar({onToggle}) {

    return (
        <section className={'sidebar'}>
            <div className="entry" onClick={() => window.location.href = '/'}>
                <HomeRoundedIcon/>
                <p>Home</p>
            </div>
            <div className="entry down" onClick={onToggle}>
                <ContrastRoundedIcon/>
                <p>Theme</p>
            </div>
        </section>
    );
}

export default SideBar;