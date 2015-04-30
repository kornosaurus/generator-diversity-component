#!/bin/bash


# Put this script in the PARENT DIR of your component, then run:
# sh create_pot_and_po_files.sh my-component-name

# To run on all components in a directory, run:
# find . -maxdepth 1 -mindepth 1 -type d -exec sh create_pot_and_po_files.sh {} \;


ROOT="$1"
COMPONENTNAME=${1##*/}

# Make sure the repo is up-to-date
GIT_STATUS=`git --git-dir $ROOT/.git --work-tree=$PWD/$ROOT pull`
if [ "$GIT_STATUS" != "Already up-to-date." ]; then
  echo "Aborted."
  echo "Please verify that `git pull` succeeded."
  echo "Then run the script again"
  exit
fi

PO_PATH="$ROOT/po/$COMPONENTNAME"
POTFILES_PATH="$PO_PATH/POTFILES.in"

# Create directories if necessary
mkdir "$PO_PATH" -p

# Create POT file
touch "$PO_PATH/messages.pot"

# Add HTML sources
if [ -e "$POTFILES_PATH" ]; then
  rm "$POTFILES_PATH"
fi
touch "$POTFILES_PATH"

# Some data to check against later
POTFILE_SIZE_PRE=`stat -c%s "$PO_PATH/messages.pot"`

# Time to generate the IN file
ls "$ROOT/" | grep .html >> "$POTFILES_PATH"
sed -i -e "s#^#$ROOT/#" "$POTFILES_PATH"
if [ -d "$ROOT/templates" ]; then
  grep -rl gettext "$ROOT/templates/" >> "$POTFILES_PATH"
fi
if [ -d "$ROOT/js" ]; then
  grep -rl gettext "$ROOT/js/" >> "$POTFILES_PATH"
fi
if [ -d "$ROOT/src" ]; then
  grep -rl gettext "$ROOT/src/" >> "$POTFILES_PATH"
fi

# Generate the POT file
xgettext -L Python -f "$POTFILES_PATH" --from-code UTF-8 -o "$PO_PATH/messages.pot" --force-po --add-comments
xgettext -j -L C -f "$POTFILES_PATH" --from-code UTF-8 -o "$PO_PATH/messages.pot" --force-po --add-comments
xgettext -j -L JavaScript -f "$POTFILES_PATH" --from-code UTF-8 -o "$PO_PATH/messages.pot" --force-po --add-comments
sed --in-place "$PO_PATH/messages.pot" --expression=s/CHARSET/UTF-8/
# sed --in-place "$PO_PATH/messages.pot" --expression="s/#: $COMPONENTNAME\//#: /"
rm "$POTFILES_PATH"

POTFILE_SIZE_POST=`stat -c%s "$PO_PATH/messages.pot"`

# We don't care if only the date has changed, and I'm too lazy to write a smarter check
if [ $POTFILE_SIZE_PRE -eq $POTFILE_SIZE_POST ]; then
  git --git-dir $ROOT/.git --work-tree=$PWD/$ROOT checkout "po/$COMPONENTNAME/messages.pot"
fi

# Function to create or update PO and JSON files
create_po () {

  if [ ! -e "$PO_PATH/$1.po" ]; then
    # Create PO file
    cp "$PO_PATH/messages.pot" "$PO_PATH/$1.po"
    sed --in-place "$PO_PATH/$1.po" --expression=s/CHARSET/UTF-8/
    sed --in-place "$PO_PATH/$1.po" --expression=s/Language:\ \\\\n/Language:\ $1\\\\n/
  else
    # Update PO file
    msgmerge "$PO_PATH/$1.po" "$PO_PATH/messages.pot" -o "$PO_PATH/$1.po"
  fi

  # Create JSON files from PO files
  po2json --domain "$COMPONENTNAME" --format jed "$PO_PATH/$1.po" "$PO_PATH/$1.json"
}

# If the POT file is exactly 580 it does not include any translations whatsoever
if [ $POTFILE_SIZE_POST -eq 580 ]; then
  rm -r "$ROOT/po"
  echo "$COMPONENTNAME: does not need translations"
else
  create_po en
  create_po sv

  cd $ROOT
  gulp minify
  cd ../

  echo "$COMPONENTNAME: updated any PO files and JSON files that needed updating"
  # Open files for review
  atom $ROOT
fi
