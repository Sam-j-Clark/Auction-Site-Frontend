import {makeStyles} from "@mui/styles";

const useStyles = makeStyles(() => ({
    pageContainer: {
        marginTop: '100px'
    },
    card: {
        margin: '10px',
    },
    cardMedia: {
        height: 0,
        paddingTop: '56.25%', // 16:9,
        margin:'10px',
    },
    sellerGrid: {
        margin: '10px'
    }
}));

export default useStyles;