import { Button, Dialog, DialogActions, InputBase, makeStyles, Paper, TextareaAutosize } from '@material-ui/core'
import React, { useEffect } from 'react'
import { DialogResponse } from '../../context/types';


const useStyles = makeStyles((theme) => ({
    size: {
      '& .MuiDialog-paperWidthMd': {
        width: '500px',
      },
    },
    search: {
      padding: '10px 0px 10px 10px',
    },
}));


interface SettingDialogProps {
    open: boolean;
    onClose: (response: DialogResponse) => void;
    onCancel: () => void;
}
  

const SettingDialog = ({open, onClose, onCancel}: SettingDialogProps) => {

    
    const classes = useStyles();

    useEffect(() => {
       if (open) {
            //do something
            console.log('open is', open);
       }
    }, [open]);


    const handleClose = async (e) => {
        e.preventDefault();
        console.log('opened')
    };


    return (
        <Dialog
            id="LicenseDialog"
            maxWidth="md"
            scroll="body"
            className={`${classes.size} dialog`}
            fullWidth open={open}
    >
      <span className="dialog-title">Settings</span>
      <form onSubmit={handleClose}>
        <div className="dialog-content">
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Name</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="name"
                fullWidth
                // value={form?.name}
                // onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">SPDX ID</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="spdxid"
                fullWidth
                // value={form?.spdxid}
                // onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">Full text</label>
            <Paper className="dialog-form-field-control">
              <TextareaAutosize
                name="fulltext"
                // value={form?.fulltext}
                cols={30}
                rows={8}
                // onChange={(e) => inputHandler(e)}
              />
            </Paper>
          </div>
          <div className="dialog-form-field">
            <label className="dialog-form-field-label">URL</label>
            <Paper className="dialog-form-field-control">
              <InputBase
                name="url"
                fullWidth
                // value={form?.url}
                // onChange={(e) => inputHandler(e)}
                required
              />
            </Paper>
          </div>
        </div>
        <DialogActions>
          <Button>Cancel</Button>
          <Button type="submit" variant="contained" color="secondary" >
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
    )
}

export default SettingDialog
