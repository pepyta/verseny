import { Avatar, Button, Checkbox, Chip, Dialog, DialogContent, DialogTitle, Fab, FormControl, Grid, Grow, Input, InputLabel, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, makeStyles, MenuItem, Select, Tab, Tabs, TextField, useTheme } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import { useRouter } from "next/router";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import MarkdownIt from "markdown-it";
import PostsWrapper from "@lib/client/wrapper/posts";
import { usePosts } from "@components/providers/PostsProvider";
import { useSnackbar } from "notistack";
import { useCategories } from "@components/providers/CategoryProvider";
import Image from "next/image";
import CategoryIcon from "@components/categories/CategoryIcon";

const md = new MarkdownIt();

const PostCreation = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setcontent] = useState("");
    const [disabled, setDisabled] = useState(false);
    const [categories, setCategories] = useState([]);

    const classes = useStyles();

    const wrapper = new PostsWrapper();
    const { addPost } = usePosts();

    const { categories: cats } = useCategories();

    const { enqueueSnackbar } = useSnackbar();

    const create = async () => {
        try {
            setDisabled(true);

            const resp = await wrapper.create({
                content,
                title,
                categories,
            });

            addPost(resp.data);
            setOpen(false);
            setTitle("");
            setcontent("");
            setCategories([]);
            enqueueSnackbar(resp.message, {
                variant: "success",
            });
        } catch (e) {
            enqueueSnackbar(e.message, {
                variant: "error",
            });
        }

        setDisabled(false);
    };

    const theme = useTheme();

    return (
        <Fragment>
            <div className={classes.root}>
                <Grow in={["/", "/posts/my"].includes(router.pathname)}>
                    <Fab variant="extended" color="primary" onClick={() => setOpen(true)}>
                        <AddRounded />
                        Bejegyzés létrehozása
                    </Fab>
                </Grow>
            </div>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bejegyzés létrehozása</DialogTitle>
                <DialogContent>
                    <PostForm disabled={disabled} onSubmit={create} title={title} setTitle={setTitle} content={content} setContent={setcontent} categories={categories} setCategories={setCategories} />
                </DialogContent>
            </Dialog>
        </Fragment>
    );
};

type TabsType = "INPUT" | "PREVIEW";

type PostFormProps = {
    title: string;
    content: string;
    categories: string[];
    setTitle: Dispatch<SetStateAction<string>>;
    setContent: Dispatch<SetStateAction<string>>;
    setCategories: Dispatch<SetStateAction<string[]>>;
    disabled: boolean;
    onSubmit: () => void;
};

export const PostForm = ({ title, setTitle, content, setContent, categories, setCategories, disabled, onSubmit }: PostFormProps) => {
    const theme = useTheme();
    const { categories: cats } = useCategories();
    
    const [selected, setSelected] = useState<"INPUT" | "PREVIEW">("INPUT");

    const error = title.length === 0 ? "A cím nem lehet üres!" : content.length === 0 ? "A tartalom nem lehet üres" : null;

    return (

        <Grid container spacing={2}>
        <Grid item xs={12}>
            <TextField
                label={"Bejegyzés címe"}
                fullWidth
                value={title}
                onChange={({ target: { value } }) => setTitle(value)}
            />
        </Grid>
        <Grid item xs={12}>
            <div style={{
                backgroundColor: "rgba(0,0,0,0.06)",
                paddingBottom: theme.spacing(1),
                borderTopLeftRadius: theme.shape.borderRadius,
                borderTopRightRadius: theme.shape.borderRadius,
            }}>

                <Tabs
                    value={selected}
                    onChange={(e, val) => setSelected(val)}

                >
                    <Tab value={"INPUT"} label="Szöveg" />
                    <Tab value={"PREVIEW"} label="Előnézet" disabled={content.length === 0} />
                </Tabs>
                {selected === "PREVIEW" && (
                    <div style={{ margin: theme.spacing(2) }} dangerouslySetInnerHTML={{ __html: md.render(content) }} />
                )}
            </div>
            {selected === "INPUT" && (
                <TextField
                    label={"Bejegyzés szövege"}
                    multiline={true}
                    fullWidth
                    value={content}
                    onChange={({ target: { value } }) => setContent(value)}
                />
            )}
        </Grid>
        <Grid item xs={12}>
            <div style={{
                backgroundColor: "rgba(0,0,0,0.06)",
                borderRadius: theme.shape.borderRadius,
            }}>
                <List dense>
                    {cats.map((category) => (
                        <ListItem>
                            <ListItemAvatar style={{ height: 40, paddingTop: 4, paddingBottom: 4 }}>
                                <CategoryIcon category={category} />
                            </ListItemAvatar>
                            <ListItemText primary={category.name} />
                            <ListItemSecondaryAction>
                                <Checkbox
                                    edge="end"
                                    onChange={(e, checked) => checked ? setCategories([...categories, category.id]) : setCategories([...categories].filter((el) => el !== category.id))}
                                    checked={categories.includes(category.id)}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </div>
        </Grid>
        <Grid item xs={12} style={{ marginBottom: 16 }}>
            <Button
                fullWidth
                variant="contained"
                color="primary"
                disabled={!!error || disabled}
                onClick={onSubmit}
            >
                {error || "Kész"}
            </Button>
        </Grid>
    </Grid>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        position: "fixed",
        right: 32,
        bottom: 32,
    },
    formControl: {
        margin: theme.spacing(1),
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
        marign: 23,
    },
    chip: {
        margin: 2,
    },
}));

export default PostCreation;