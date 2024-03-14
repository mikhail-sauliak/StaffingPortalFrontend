import { TableCell, TableRow, tableCellClasses, Button,TableContainer } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  borderWidth: 1,
  borderStyle: 'solid',
  textAlign: 'center',
  borderColor: theme.palette.divider
}));

// export const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   [`&.${tableCellClasses.root}`]: {
//     borderWidth: 1,
//     borderStyle: 'solid',
//     textAlign: 'center',
//     borderColor: theme.palette.divider,
//     fontSize: '0.875rem',
//   }
// }));
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.root}`]: {
    borderWidth: 1,
    borderStyle: 'solid',
    textAlign: 'center',
    borderColor: theme.palette.divider,
    fontSize: '0.85rem', 
    padding: '8px',
    minHeight: '20px'
  }
}));

export const CenteredTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: theme.palette.action.hover, 
}));

// export const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   '&:nth-of-type(odd)': {
//     backgroundColor: theme.palette.action.hover,
//   },
//   '& .totalColumn': {
//     fontWeight: 'bold',
//     backgroundColor: theme.palette.action.selected,
//     borderWidth: 1,
//     borderStyle: 'solid',
//     borderColor: theme.palette.divider
//   }
// }));
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .totalColumn': {
    fontWeight: 'bold',
    backgroundColor: theme.palette.action.selected,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    fontSize: '0.85rem', // Уменьшенный размер шрифта для столбца с итогами, если нужно
    padding: '8px', // Уменьшенные внутренние отступы для столбца с итогами, если нужно
  },
  // Добавление свойств для изменения высоты строк
  [`&.${tableCellClasses.root}`]: {
    height: '40px', // Установка фиксированной высоты строки
  },
}));

export const DeleteButton = styled(Button)(({ theme }) => ({
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
    '&:hover': {
        backgroundColor: theme.palette.error.dark,
    },
}));

export const StyledTableContainer = styled(TableContainer)({
    marginTop: '24px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    backgroundColor: '#fff',
  });