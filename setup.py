from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="script-spliter",
    version="0.1.0",
    description="Convert large JavaScript files into structured, modular components",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Script Spliter Team",
    url="https://github.com/jomardyan/ScriptSpliter",
    project_urls={
        "Bug Tracker": "https://github.com/jomardyan/ScriptSpliter/issues",
        "Source": "https://github.com/jomardyan/ScriptSpliter",
        "Documentation": "https://github.com/jomardyan/ScriptSpliter#readme",
    },
    python_requires=">=3.8",
    packages=find_packages(exclude=["tests", "test_*", "*_test", "examples"]),
    include_package_data=True,
    install_requires=[
        "regex>=2023.0.0",
        "PyYAML>=6.0",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0",
            "black>=21.0",
            "flake8>=3.9",
            "mypy>=0.910",
        ],
    },
    entry_points={
        "console_scripts": [
            "script-spliter=script_spliter.cli:main",
        ],
    },
    keywords="javascript modular refactoring code-splitting dependency-analysis",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Software Development :: Tools",
        "Topic :: Text Processing :: Markup :: HTML",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Environment :: Console",
    ],
)
