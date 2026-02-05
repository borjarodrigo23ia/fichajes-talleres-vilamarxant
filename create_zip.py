
import os
import zipfile

def zipdir(path, ziph):
    # path represents the directory to zip (e.g. 'fichajestrabajadores')
    # we want the archive to effectively contain 'fichajestrabajadores/...'
    # so we walk the path, and the arcname should be the relative path from the *parent* of path.
    
    # We assume we are running this from the parent directory of 'fichajestrabajadores'
    parent_dir = os.path.dirname(os.path.abspath(path))
    
    for root, dirs, files in os.walk(path):
        for file in files:
            abs_file = os.path.join(root, file)
            # relative path from the parent of 'fichajestrabajadores'
            # e.g. if path is c:\repo\fichajes, parent is c:\repo
            # file is c:\repo\fichajes\core\mod.php
            # rel is fichajestrabajadores\core\mod.php
            rel_path = os.path.relpath(abs_file, parent_dir)
            ziph.write(abs_file, rel_path)

if __name__ == '__main__':
    # We are getting 'custom/fichajestrabajadores' but we want the zip root to be 'fichajestrabajadores'
    # The current zipdir function takes a path and walks it.
    # If we pass 'custom/fichajestrabajadores', relpath will be relative to 'custom'. 
    # So valid archive structure 'fichajestrabajadores/...' will be preserved.
    module_dir = 'fichajestrabajadores' 
    zip_name = 'module_fichajestrabajadores-2.6.zip'
    
    print(f"Creating {zip_name} from {module_dir}...")
    
    if os.path.exists(zip_name):
        try:
            os.remove(zip_name)
        except OSError as e:
            print(f"Error removing existing zip: {e}")
        
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipdir(module_dir, zipf)

        
    print(f"Successfully created {zip_name}")
