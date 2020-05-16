import argparse, os, subprocess, shutil

def main():
    folder_name = "process-function-container"

    parser = argparse.ArgumentParser(description="Generate Dockerfile for container")
    parser.add_argument("-n", "--name", help="Folder name")
    parser.add_argument("-f", "--process-function", help="Processing function")
    parser.add_argument("-r", "--requirements", help="Pip requirements file")
    parser.add_argument("-d", "--directory", help="Additional folders")
    parser.add_argument("-l", "--local", help="Path to local pip packages")
    options = parser.parse_args()

    if options.name is not None:
        folder_name = options.name
    base_path = os.path.join(os.path.join(folder_name, "src"), "process")

    subprocess.call(["git", "clone", "https://www.github.com/columbustech/function-container-template"])
    shutil.move("function-container-template", folder_name)

    if options.process_function is None:
        print("Please provide a process function with the -f flag")

    shutil.copy(options.profiler, os.path.join(base_path, "process.py"))

    if options.directory is not None:
        shutil.copytree(options.directory, os.path.join(base_path, os.path.dirname(os.path.join(options.directory, ""))))

    if options.requirements is not None:
        req = None
        with open(options.requirements, "r") as f:
            req = f.read()
        with open(os.path.join(os.path.join(folder_name,"src"), "requirements.txt"), "a") as f:
            f.write(req)

    if options.local is not None:
        shutil.copytree(options.local, os.path.join(os.path.join(folder_name, "src"), os.path.dirname(os.path.join(options.local, ""))))

if __name__ == "__main__":
    main()
