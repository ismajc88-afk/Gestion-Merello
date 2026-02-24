/**
 * Entity: Member (Fallero/a)
 *
 * Represents a member of the Falla.
 * This is a core domain entity — no external dependencies.
 */

export interface MemberProps {
    id?: string;
    firstName: string;
    lastName: string;
    dni: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate?: Date;
    registrationDate: Date;
    isActive: boolean;
    category: MemberCategory;
}

export enum MemberCategory {
    INFANTIL = 'INFANTIL',
    JUVENIL = 'JUVENIL',
    ADULTO = 'ADULTO',
    JUBILADO = 'JUBILADO',
    HONORARIO = 'HONORARIO',
}

export class Member {
    private readonly props: MemberProps;

    private constructor(props: MemberProps) {
        Member.validate(props);
        this.props = Object.freeze({ ...props });
    }

    static create(props: MemberProps): Member {
        return new Member({
            ...props,
            registrationDate: props.registrationDate ?? new Date(),
            isActive: props.isActive ?? true,
        });
    }

    static reconstitute(props: MemberProps): Member {
        return new Member(props);
    }

    private static validate(props: MemberProps): void {
        if (!props.firstName || props.firstName.trim().length === 0) {
            throw new Error('El nombre del fallero es obligatorio.');
        }
        if (!props.lastName || props.lastName.trim().length === 0) {
            throw new Error('Los apellidos del fallero son obligatorios.');
        }
        if (!props.dni || !Member.isValidDni(props.dni)) {
            throw new Error('El DNI proporcionado no es válido.');
        }
    }

    private static isValidDni(dni: string): boolean {
        const dniRegex = /^[0-9]{8}[A-Za-z]$/;
        const nieRegex = /^[XYZxyz][0-9]{7}[A-Za-z]$/;
        return dniRegex.test(dni) || nieRegex.test(dni);
    }

    // --- Getters ---

    get id(): string | undefined {
        return this.props.id;
    }

    get firstName(): string {
        return this.props.firstName;
    }

    get lastName(): string {
        return this.props.lastName;
    }

    get fullName(): string {
        return `${this.props.firstName} ${this.props.lastName}`;
    }

    get dni(): string {
        return this.props.dni;
    }

    get email(): string | undefined {
        return this.props.email;
    }

    get phone(): string | undefined {
        return this.props.phone;
    }

    get address(): string | undefined {
        return this.props.address;
    }

    get birthDate(): Date | undefined {
        return this.props.birthDate;
    }

    get registrationDate(): Date {
        return this.props.registrationDate;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get category(): MemberCategory {
        return this.props.category;
    }

    // --- Domain Methods ---

    deactivate(): Member {
        return Member.reconstitute({ ...this.props, isActive: false });
    }

    activate(): Member {
        return Member.reconstitute({ ...this.props, isActive: true });
    }

    changeCategory(newCategory: MemberCategory): Member {
        return Member.reconstitute({ ...this.props, category: newCategory });
    }

    updateContactInfo(contact: { email?: string; phone?: string; address?: string }): Member {
        return Member.reconstitute({
            ...this.props,
            email: contact.email ?? this.props.email,
            phone: contact.phone ?? this.props.phone,
            address: contact.address ?? this.props.address,
        });
    }

    toPlainObject(): MemberProps {
        return { ...this.props };
    }
}
