import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Breadcrumb } from "antd";

const BreadcrumbsComponent = () => {
    const { url } = usePage();

    const generateBreadcrumbs = () => {
        const pathnames = url.split("/").filter((x) => x);

        const breadcrumbs = [
            { label: "Dashboard", href: "/" },
            ...pathnames.map((pathname, index) => {
                const href = `/${pathnames.slice(0, index + 1).join("/")}`;
                const label = pathname
                    .replace("-", " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase());
                return { label, href };
            }),
        ];

        return breadcrumbs;
    };

    return (
        <nav className="breadcrumb pt-5 pl-5">
            <Breadcrumb>
                {generateBreadcrumbs().map((breadcrumb, index) => (
                    <Breadcrumb.Item key={index}>
                        <Link href={breadcrumb.href} className="text-blue-500">
                            {breadcrumb.label}
                        </Link>
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        </nav>
    );
};

export default BreadcrumbsComponent;
