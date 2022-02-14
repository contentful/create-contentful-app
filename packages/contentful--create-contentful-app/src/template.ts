import degit from 'degit';

export async function clone(name: string, destination: string) {
  const d = degit(`contentful/apps/templates/${name}`, { mode: 'tar' });

  try {
    await d.clone(destination);
  } catch (e: any) {
    let message = 'Error creating app';
    if (e.code === 'DEST_NOT_EMPTY') {
      message = 'destination directory is not empty';
    }
    throw new Error(message);
  }
}
